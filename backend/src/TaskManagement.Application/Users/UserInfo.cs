namespace TaskManagement.Application.Users;

public sealed record UserInfo
{
    public required int Id { get; init; }

    public required string Email { get; init; }

    public required string FullName { get; init; }

    public required string Role { get; init; }

    public required bool MustChangePassword { get; init; }

    public required DateTime CreatedAt { get; init; }
}
