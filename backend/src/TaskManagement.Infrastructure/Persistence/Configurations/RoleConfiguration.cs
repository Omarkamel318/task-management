using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<IdentityRole<int>>
{
    public void Configure(EntityTypeBuilder<IdentityRole<int>> builder)
    {
        builder.ToTable("Roles");
    }
}
