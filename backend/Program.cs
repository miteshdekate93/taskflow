using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TaskManager.Api.Data;
using TaskManager.Api.Models;
using TaskManager.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ───────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT Authentication ─────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["JwtSettings:Secret"]
    ?? throw new InvalidOperationException("JwtSettings:Secret is required.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "TaskManagerApi",
            ValidAudience = "TaskManagerClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// ── Services ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<TokenService>();

// ── Swagger ────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Task Manager API",
        Version = "v1",
        Description = "Full-stack Task Manager — .NET 8 Web API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── CORS ───────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// ── Health Checks ──────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

var app = builder.Build();

// ── Middleware ─────────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager API v1"));

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// ── Auto-migrate on startup ────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ── Health Check Endpoint ──────────────────────────────────────────────────
app.MapHealthChecks("/health");

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

app.MapPost("/api/auth/register", async (RegisterRequest req, AppDbContext db, TokenService tokenSvc) =>
{
    if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest(new { message = "Username and password are required." });

    if (req.Password.Length < 6)
        return Results.BadRequest(new { message = "Password must be at least 6 characters." });

    if (await db.Users.AnyAsync(u => u.Username == req.Username))
        return Results.Conflict(new { message = "Username already exists." });

    var user = new User
    {
        Username = req.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    var token = tokenSvc.GenerateToken(user);
    return Results.Ok(new { token, username = user.Username });
})
.WithName("Register")
.WithTags("Auth")
.WithSummary("Register a new user");

app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, TokenService tokenSvc) =>
{
    if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest(new { message = "Username and password are required." });

    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
    if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return Results.Unauthorized();

    var token = tokenSvc.GenerateToken(user);
    return Results.Ok(new { token, username = user.Username });
})
.WithName("Login")
.WithTags("Auth")
.WithSummary("Login and receive a JWT token");

// ═══════════════════════════════════════════════════════════════════════════
// TASK ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

app.MapGet("/api/tasks", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    if (userId is null) return Results.Unauthorized();

    var tasks = await db.Tasks
        .Where(t => t.UserId == userId.Value)
        .OrderByDescending(t => t.CreatedAt)
        .Select(t => new TaskResponse(t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt, t.DueDate))
        .ToListAsync();

    return Results.Ok(tasks);
})
.RequireAuthorization()
.WithName("GetTasks")
.WithTags("Tasks")
.WithSummary("Get all tasks for the authenticated user");

app.MapPost("/api/tasks", async (CreateTaskRequest req, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    if (userId is null) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest(new { message = "Title is required." });

    var task = new TaskItem
    {
        Title = req.Title.Trim(),
        Description = req.Description?.Trim(),
        DueDate = req.DueDate,
        UserId = userId.Value
    };

    db.Tasks.Add(task);
    await db.SaveChangesAsync();

    return Results.Created($"/api/tasks/{task.Id}",
        new TaskResponse(task.Id, task.Title, task.Description, task.IsCompleted, task.CreatedAt, task.DueDate));
})
.RequireAuthorization()
.WithName("CreateTask")
.WithTags("Tasks")
.WithSummary("Create a new task");

app.MapPut("/api/tasks/{id:int}", async (int id, UpdateTaskRequest req, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    if (userId is null) return Results.Unauthorized();

    var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);
    if (task is null) return Results.NotFound(new { message = "Task not found." });

    if (!string.IsNullOrWhiteSpace(req.Title))
        task.Title = req.Title.Trim();

    task.Description = req.Description?.Trim();
    task.IsCompleted = req.IsCompleted;
    task.DueDate = req.DueDate;

    await db.SaveChangesAsync();

    return Results.Ok(new TaskResponse(task.Id, task.Title, task.Description, task.IsCompleted, task.CreatedAt, task.DueDate));
})
.RequireAuthorization()
.WithName("UpdateTask")
.WithTags("Tasks")
.WithSummary("Update an existing task");

app.MapDelete("/api/tasks/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    if (userId is null) return Results.Unauthorized();

    var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);
    if (task is null) return Results.NotFound(new { message = "Task not found." });

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();

    return Results.NoContent();
})
.RequireAuthorization()
.WithName("DeleteTask")
.WithTags("Tasks")
.WithSummary("Delete a task");

app.Run();

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS & RECORDS
// ═══════════════════════════════════════════════════════════════════════════

static int? GetUserId(ClaimsPrincipal user)
{
    var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return int.TryParse(claim, out var id) ? id : null;
}

record RegisterRequest(string Username, string Password);
record LoginRequest(string Username, string Password);
record CreateTaskRequest(string Title, string? Description, DateTime? DueDate);
record UpdateTaskRequest(string Title, string? Description, bool IsCompleted, DateTime? DueDate);
record TaskResponse(int Id, string Title, string? Description, bool IsCompleted, DateTime CreatedAt, DateTime? DueDate);
