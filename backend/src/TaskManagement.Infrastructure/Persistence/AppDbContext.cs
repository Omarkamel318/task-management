using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<int>, int>(options), IAppDbContext
{
    IQueryable<UserInfo> IAppDbContext.Users =>
        Users.AsNoTracking().Select(u => new UserInfo(
            u.Id,
            u.Email!,
            u.FullName,
            UserRoles.Where(ur => ur.UserId == u.Id)
                .Join(Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
                .FirstOrDefault() ?? string.Empty,
            u.MustChangePassword,
            u.CreatedAt));

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var foreignKey in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }
}
