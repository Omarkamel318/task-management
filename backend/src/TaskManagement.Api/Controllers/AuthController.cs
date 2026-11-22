using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Auth;
using TaskManagement.Application.Auth.DTOs;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users;
using TaskManagement.Application.Users.DTOs;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService,
    IUserService userService,
    ICurrentUser currentUser) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("sign-in")]
    public async Task<ActionResult<AuthResponse>> SignIn(SignInRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.SignInAsync(request, cancellationToken);
        if (response is null)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Unauthorized",
                detail: "Wrong email or password.");
        }

        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not { } userId)
        {
            return Unauthorized();
        }

        var user = await userService.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(user);
    }
}
