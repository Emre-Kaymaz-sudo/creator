# Course Package Builder

Course Package Builder is a web application that allows users to browse predefined course packages or build their own custom package by selecting individual courses.

## Features

- Browse ready-made course packages
- View course details, prerequisites, and categories
- Search and filter courses by category
- Create custom packages with selected courses
- Automatic price calculation with discounts
- Prerequisite validation for courses

## Docker Usage

### Pull the image from Docker Hub

```bash
docker pull emrekaymaz/course-package-builder
```

### Run the container

```bash
docker run -d -p 8080:80 emrekaymaz/course-package-builder
```

This will start the application and make it available at http://localhost:8080

### Building the image locally

If you want to build the Docker image locally:

```bash
# Clone the repository
git clone https://github.com/emrekaymaz/course-package-builder.git
cd course-package-builder

# Build the Docker image
docker build -t course-package-builder .

# Run the container
docker run -d -p 8080:80 course-package-builder
```

## Technologies Used

- HTML5
- CSS (with Tailwind CSS)
- JavaScript
- Docker
- Nginx

## License

MIT 