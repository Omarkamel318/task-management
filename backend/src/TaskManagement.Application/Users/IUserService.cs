using TaskManagement.Application.Users.DTOs;

namespace TaskManagement.Application.Users;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
