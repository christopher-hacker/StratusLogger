# Changelog

## [0.0.3] - 2021-04-20

### Added:

- Player now jumps back 1s on hitting play to prevent users from having to rewind constantly (e871fc149de38a8286e0812960bc0c3a128680db)
- If video is playing, inserts timestamps 1s before the actual time of insertion, to ensure timestamps are always at/before the bite (20d3a42b7865cccae6cb71a2dcd0822b6f68e627)
- Basic spellcheck (61626206366e97d1c7c95bf1a789b968676e5458)

### Fixed:

- Fixed video load problems when trying to jump to a timestamp while video is playing (43b419f13d7ebd8aa2f3769cf3083e74fd62dc8d)
- Improved keyboard shortcut handling to reduce conflicts while video loads (a909cb6288609ffeed9283cf883835bba812b5fe)
- Timestamps no longer contain frame numbers (365764ae4cf8e1c2137f7aec18a86cb14752eb74)

### Removed:

- Removed outdated shortcut hint from the download button (98166fd5017cdb2f5f16d2ed89046cd83ecfcc53)
- Removed keyboard shortcut for downloading as document (a909cb6288609ffeed9283cf883835bba812b5fe)

## [0.0.2] - 2021-04-14

### Fixed:

- Support for both types of URL formats (687f83c4aaa72c0d9fb6ffa9d45befeb24caa843)
- Force editor to scroll down on insertion of empty new line (6c106d9800b0daf29268deebd8cff8ab5d7537bb)
- Keyboard shortcuts that don't interfere with Chrome defaults (6c0746375c277448797eaffb575f1ececd0f3094)
