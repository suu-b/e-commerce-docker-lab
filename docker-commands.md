# General
1. `docker --version`
2. `docker info`
3. `docker compose version` 
4. `docker system df`

# Images
| Command                      | Explanation                                   |
| ---------------------------- | --------------------------------------------- |
| `docker ps`                  | Lists running containers.                     |
| `docker ps -a`               | Lists all containers, including stopped ones. |
| `docker run nginx`           | Creates and starts a container.               |
| `docker start <container>`   | Starts an existing stopped container.         |
| `docker stop <container>`    | Gracefully stops a container.                 |
| `docker restart <container>` | Restarts a container.                         |
| `docker rm <container>`      | Removes a stopped container.                  |
| `docker kill <container>`    | Immediately terminates a container.           |
| `docker rename old new`      | Renames a container.                          |

# Debugging
| Command                            | Explanation                                 |
| ---------------------------------- | ------------------------------------------- |
| `docker logs <container>`          | Displays container logs.                    |
| `docker logs -f <container>`       | Follows logs continuously.                  |
| `docker exec -it <container> bash` | Opens an interactive Bash shell.            |
| `docker exec -it <container> sh`   | Opens a shell (useful for Alpine images).   |
| `docker inspect <container>`       | Displays detailed container configuration.  |
| `docker stats`                     | Shows live CPU, memory and network usage.   |
| `docker top <container>`           | Shows processes running inside a container. |
| `docker port <container>`          | Displays published ports.                   |

# Volumes
| Command                        | Explanation              |
| ------------------------------ | ------------------------ |
| `docker volume ls`             | Lists volumes.           |
| `docker volume create mydata`  | Creates a volume.        |
| `docker volume inspect mydata` | Displays volume details. |
| `docker volume rm mydata`      | Removes a volume.        |
| `docker volume prune`          | Removes unused volumes.  |

# Network
| Command                                         | Explanation                        |
| ----------------------------------------------- | ---------------------------------- |
| `docker network ls`                             | Lists networks.                    |
| `docker network create mynetwork`               | Creates a network.                 |
| `docker network inspect mynetwork`              | Displays network configuration.    |
| `docker network connect mynetwork container`    | Connects a container to a network. |
| `docker network disconnect mynetwork container` | Disconnects a container.           |
| `docker network rm mynetwork`                   | Removes a network.                 |

# Compose
| Command                            | Explanation                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| `docker compose up`                | Creates and starts services.                                  |
| `docker compose up -d`             | Starts services in the background.                            |
| `docker compose down`              | Stops and removes containers and networks created by Compose. |
| `docker compose stop`              | Stops services without removing containers.                   |
| `docker compose start`             | Starts previously stopped services.                           |
| `docker compose restart`           | Restarts services.                                            |
| `docker compose ps`                | Lists Compose containers.                                     |
| `docker compose logs`              | Displays service logs.                                        |
| `docker compose logs -f`           | Follows logs continuously.                                    |
| `docker compose build`             | Builds or rebuilds service images.                            |
| `docker compose exec <service> sh` | Opens a shell inside a running service.                       |
| `docker compose pull`              | Downloads service images.                                     |
| `docker compose config`            | Validates and displays the resolved Compose configuration.    |

# Cleaning up
| Command                  | Explanation                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `docker container prune` | Removes stopped containers.                                           |
| `docker image prune`     | Removes dangling images.                                              |
| `docker image prune -a`  | Removes all unused images.                                            |
| `docker volume prune`    | Removes unused volumes.                                               |
| `docker network prune`   | Removes unused networks.                                              |
| `docker system prune`    | Removes unused containers, networks, dangling images and build cache. |
| `docker system prune -a` | Also removes all unused images.                                       |