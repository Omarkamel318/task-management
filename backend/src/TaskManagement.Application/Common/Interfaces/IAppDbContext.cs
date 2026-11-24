using TaskManagement.Application.Users;

namespace TaskManagement.Application.Common.Interfaces;

public interface IAppDbContext
{
    IQueryable<UserInfo> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
