using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using TaskManagement.Application.Auth;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users;

namespace TaskManagement.Infrastructure.Auth;

public sealed class TokenService : ITokenService
{
    private readonly JwtOptions _jwt;
    private readonly IClock _clock;
    private readonly SigningCredentials _signingCredentials;
    private readonly JsonWebTokenHandler _handler = new();

    public TokenService(IOptions<JwtOptions> options, IClock clock)
    {
        _jwt = options.Value;
        _clock = clock;
        _signingCredentials = new SigningCredentials(_jwt.CreateSigningKey(), SecurityAlgorithms.HmacSha256);
    }

    public AccessToken Create(UserInfo user)
    {
        var now = _clock.UtcNow;
        var expiresAt = now.AddHours(_jwt.ExpiryHours);

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _jwt.Issuer,
            Audience = _jwt.Audience,
            IssuedAt = now,
            NotBefore = now,
            Expires = expiresAt,
            SigningCredentials = _signingCredentials,
            Claims = new Dictionary<string, object>
            {
                [AppClaimTypes.UserId] = user.Id.ToString(CultureInfo.InvariantCulture),
                [AppClaimTypes.Email] = user.Email,
                [AppClaimTypes.Name] = user.FullName,
                [AppClaimTypes.Role] = user.Role,
                [AppClaimTypes.TokenId] = Guid.NewGuid().ToString()
            }
        };

        return new AccessToken(_handler.CreateToken(descriptor), expiresAt);
    }
}
