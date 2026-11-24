using Microsoft.IdentityModel.JsonWebTokens;

namespace TaskManagement.Infrastructure.Auth;

public static class AppClaimTypes
{
    public const string UserId = JwtRegisteredClaimNames.Sub;

    public const string Email = JwtRegisteredClaimNames.Email;

    public const string Name = JwtRegisteredClaimNames.Name;

    public const string Role = "role";

    public const string TokenId = JwtRegisteredClaimNames.Jti;
}
