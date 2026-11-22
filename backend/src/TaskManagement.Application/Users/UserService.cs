using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users.DTOs;

namespace TaskManagement.Application.Users;

public sealed class UserService(IAppDbContext db) : IUserService
{
    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        return user is null ? null : UserDto.From(user);
    }
}
