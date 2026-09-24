using System;
using System.Collections.Generic;
using System.Text;

namespace CulinaryBlog.Application.Services
{
    public interface ITokenService
    {
        string CreateToken(Microsoft.AspNetCore.Identity.IdentityUser user, IList<string> roles);
    }
}
