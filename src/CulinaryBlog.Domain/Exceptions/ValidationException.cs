namespace CulinaryBlog.Domain.Exceptions
{
    public class ValidationException : DomainException
    {
        public ValidationException(string message) : base(message)
        {
        }

        public ValidationException(IEnumerable<string> errors)
            : base("One or more validation failures have occurred.")
        {
            Errors = errors;
        }

        public IEnumerable<string> Errors { get; } = new List<string>();
    }
}