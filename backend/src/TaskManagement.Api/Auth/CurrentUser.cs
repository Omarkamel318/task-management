using System.Globalization;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Infrastructure.Auth;

namespace TaskManagement.Api.Auth;

public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public int? UserId =>
        int.TryParse(httpContextAccessor.HttpContext?.User.FindFirst(AppClaimTypes.UserId)?.Value,
            NumberStyles.None, CultureInfo.InvariantCulture, out var id)
            ? id
            : null;

    public string? Role => httpContextAccessor.HttpContext?.User.FindFirst(AppClaimTypes.Role)?.Value;

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
