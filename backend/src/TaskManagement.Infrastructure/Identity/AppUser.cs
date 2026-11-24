using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Infrastructure.Identity;

public sealed class AppUser : IdentityUser<int>
{
    public string FullName { get; set; } = string.Empty;

    public bool MustChangePassword { get; set; }

    public DateTime CreatedAt { get; set; }
}
