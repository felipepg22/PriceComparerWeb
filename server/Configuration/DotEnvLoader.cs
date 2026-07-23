namespace PriceComparerWeb.Api.Configuration;

public static class DotEnvLoader
{
    public static void LoadFromAncestors(params string[] startPaths)
    {
        var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var startPath in startPaths)
        {
            var directory = new DirectoryInfo(Path.GetFullPath(startPath));
            while (directory is not null)
            {
                var path = Path.Combine(directory.FullName, ".env");
                if (visited.Add(path))
                {
                    Load(path);
                }

                directory = directory.Parent;
            }
        }
    }

    public static void Load(params string[] paths)
    {
        foreach (var path in paths.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!File.Exists(path))
            {
                continue;
            }

            foreach (var rawLine in File.ReadLines(path))
            {
                var line = rawLine.Trim();
                if (line.Length == 0 || line.StartsWith('#'))
                {
                    continue;
                }

                if (line.StartsWith("export ", StringComparison.Ordinal))
                {
                    line = line[7..].TrimStart();
                }

                var separator = line.IndexOf('=');
                if (separator <= 0)
                {
                    continue;
                }

                var key = line[..separator].Trim();
                var value = line[(separator + 1)..].Trim();
                if (key.Length == 0 || Environment.GetEnvironmentVariable(key) is not null)
                {
                    continue;
                }

                Environment.SetEnvironmentVariable(key, Unquote(value));
            }
        }
    }

    private static string Unquote(string value)
    {
        if (value.Length >= 2 &&
            ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
        {
            return value[1..^1];
        }

        return value;
    }
}
