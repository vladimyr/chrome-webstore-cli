Chrome Webstore CLI
================================

This utility enables querying Chrome Webstore from terminal by providing following functionalities:

- `list` - obtaining information about locally installed extensions
- `show <extension-id>` - obtaining information for specific extension
- `download <extension-id>` - downloading requested extension locally

## Installation

```bash    
npm install -g chrome-webstore-cli
```

## How to use

Invoke `cws` inside your terminal followed by desired command:

```bash
Usage:
  cws (command) <options>

Commands:
  list      List locally installed extensions
  info      Show extension info
  download  Downloads extension\'s package (.crx) from webstore

Options:
  --version   Show version number                            [boolean]
  -h, --help  Show help                                      [boolean]

```

Type `cws (command) --help` for command specific help.
