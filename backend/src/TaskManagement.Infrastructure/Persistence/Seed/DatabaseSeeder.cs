using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Domain.Users;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Infrastructure.Persistence.Seed;

public sealed class DatabaseSeeder(
    RoleManager<IdentityRole<int>> roleManager,
    UserManager<AppUser> userManager,
    IOptions<AdminSeedOptions> options,
    IClock clock)
{
    private readonly AdminSeedOptions _admin = options.Value;

    public async Task SeedAsync()
    {
        await SeedRolesAsync();
        await SeedAdminAsync();
    }

    private async Task SeedRolesAsync()
    {
        foreach (var role in Roles.All)
        {
            if (await roleManager.RoleExistsAsync(role))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<int>(role));
            EnsureSucceeded(result, $"create role '{role}'");
        }
    }

    private async Task SeedAdminAsync()
    {
        var admins = await userManager.GetUsersInRoleAsync(Roles.Admin);
        if (admins.Count > 0)
        {
            return;
        }

        EnsureConfigured(_admin.AdminEmail, nameof(AdminSeedOptions.AdminEmail));
        EnsureConfigured(_admin.AdminFullName, nameof(AdminSeedOptions.AdminFullName));
        EnsureConfigured(_admin.AdminPassword, nameof(AdminSeedOptions.AdminPassword));

        var user = new AppUser
        {
            UserName = _admin.AdminEmail,
            Email = _admin.AdminEmail,
            EmailConfirmed = true,
            FullName = _admin.AdminFullName,
            MustChangePassword = _admin.AdminMustChangePassword,
            CreatedAt = clock.UtcNow
        };

        var created = await userManager.CreateAsync(user, _admin.AdminPassword);
        EnsureSucceeded(created, "create the Admin user");

        var addedToRole = await userManager.AddToRoleAsync(user, Roles.Admin);
        EnsureSucceeded(addedToRole, "add the Admin user to the Admin role");
    }

    private static void EnsureConfigured(string value, string key)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"Setting '{AdminSeedOptions.SectionName}:{key}' is missing.");
        }
    }

    private static void EnsureSucceeded(IdentityResult result, string action)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(" ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"Seed failed to {action}: {errors}");
    }
}
