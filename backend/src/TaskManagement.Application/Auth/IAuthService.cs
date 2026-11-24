using TaskManagement.Application.Auth.DTOs;

namespace TaskManagement.Application.Auth;

public interface IAuthService
{
    Task<AuthResponse?> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default);
}
