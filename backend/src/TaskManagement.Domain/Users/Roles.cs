namespace TaskManagement.Domain.Users;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Senior = "Senior";
    public const string Junior = "Junior";

    public static readonly IReadOnlyList<string> All = [Admin, Manager, Senior, Junior];
}
