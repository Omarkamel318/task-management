using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TaskManagement.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public const int MinKeyLength = 32;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public string Key { get; init; } = string.Empty;

    public int ExpiryHours { get; init; } = 8;

    public SymmetricSecurityKey CreateSigningKey() => new(Encoding.UTF8.GetBytes(Key));
}
