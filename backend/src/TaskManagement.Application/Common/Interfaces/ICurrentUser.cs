namespace TaskManagement.Application.Common.Interfaces;

public interface ICurrentUser
{
    int? UserId { get; }

    string? Role { get; }

    bool IsAuthenticated { get; }
}
