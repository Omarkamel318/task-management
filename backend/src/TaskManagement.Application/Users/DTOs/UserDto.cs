namespace TaskManagement.Application.Users.DTOs;

public sealed record UserDto(int Id, string Email, string FullName, string Role)
{
    public static UserDto From(UserInfo user) => new(user.Id, user.Email, user.FullName, user.Role);
}
