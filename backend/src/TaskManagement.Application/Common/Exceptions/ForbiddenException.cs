namespace TaskManagement.Application.Common.Exceptions;

public sealed class ForbiddenException(string message = "You are not allowed to do this action.")
    : Exception(message);
