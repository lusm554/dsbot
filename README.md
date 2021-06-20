## Dsbot

Some possibilities:
- Timer
- Random umareska - https://vk.com/dev/wall.get
- Stack for csgo(or another game)

## Docker
```Docker
docker build -t dsbot .
```
```Docker
docker run -d dsbot
```

In Dockerfile use only COPY(without `npm i`) because while installing modules error -></br>
```bash
npm ERR! enoent Error while executing:
pm ERR! enoent undefined ls-remote -h -t ssh://git@github.com/discordjs/Commando.git
```
<h4>Todo:</h4>

- Class for game stack
- The ability to lift the board from game stack
- New view of bot commands info
- Add internal coin (in future) 
