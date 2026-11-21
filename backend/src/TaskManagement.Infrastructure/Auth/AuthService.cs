using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Auth;
using TaskManagement.Application.Auth.DTOs;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users.DTOs;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Infrastructure.Auth;

public sealed class AuthService(
    UserManager<AppUser> userManager,
    IAppDbContext db,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse?> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return null;
        }

        var info = await db.Users.FirstAsync(u => u.Id == user.Id, cancellationToken);
        var token = tokenService.Create(info);

        return new AuthResponse(token.Token, token.ExpiresAt, UserDto.From(info));
    }
}
