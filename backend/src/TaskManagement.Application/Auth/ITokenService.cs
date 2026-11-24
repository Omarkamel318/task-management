using TaskManagement.Application.Users;

namespace TaskManagement.Application.Auth;

public interface ITokenService
{
    AccessToken Create(UserInfo user);
}
