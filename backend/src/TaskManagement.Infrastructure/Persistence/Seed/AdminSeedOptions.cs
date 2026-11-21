namespace TaskManagement.Infrastructure.Persistence.Seed;

public sealed class AdminSeedOptions
{
    public const string SectionName = "Seed";

    public string AdminEmail { get; init; } = string.Empty;

    public string AdminFullName { get; init; } = string.Empty;

    public string AdminPassword { get; init; } = string.Empty;

    public bool AdminMustChangePassword { get; init; } = true;
}
