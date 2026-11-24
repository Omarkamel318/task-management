using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Infrastructure.Identity;

public sealed class LetterPasswordValidator : IPasswordValidator<AppUser>
{
    public Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user, string? password)
    {
        if (password is not null && password.Any(char.IsLetter))
        {
            return Task.FromResult(IdentityResult.Success);
        }

        return Task.FromResult(IdentityResult.Failed(new IdentityError
        {
            Code = "PasswordRequiresLetter",
            Description = "Passwords must have at least one letter."
        }));
    }
}
