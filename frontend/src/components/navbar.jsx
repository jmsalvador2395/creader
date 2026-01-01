import react from "react";

const Navbar = active_tab => {
    return (
        <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">MediaServer</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            {/* left aligned nav links */}
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                {/* <a href="{% url 'home' %}" class="nav-link {% if request.path == '/home/' %}active{% endif %}" aria-current="page" href="#">Home</a> */}
                </li>
                <li class="nav-item">
                <a href="{% url 'explorer-root' %}" class="nav-link {% if request.path|slice:'0:9' == '/explorer' %}active{% endif %}">Explorer</a>
                </li>
                <li class="nav-item">
                <a href="{% url 'library' %}" class="nav-link {% if request.path|slice:'0:8' == '/library' %}active{% endif %}">Library</a>
                </li>
                <li class="nav-item">
                <a href="{% url 'bookmarks' %}" class="nav-link {% if request.path|slice:'0:10' == '/bookmarks' %}active{% endif %}">Bookmarks</a>
                </li>
            </ul>

            {/* search form */}
            <form class="d-flex me-3" role="search">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>A
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>

            {/* user dropdown */}
            <ul class="navbar-nav">
                <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-4"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="#">Profile</a></li>
                    <li><a class="dropdown-item" href="#">Settings</a></li>
                    <li><hr class="dropdown-divider"/></li>
                    <li>
                    <form method="POST" action="{% url 'logout' %}" class="dropdown-item p-0 m-0">
                        {/* {% csrf_token %} */}
                        <button type="submit" class="btn btn-link dropdown-item text-start">Logout</button>
                    </form>
                    </li>
                </ul>
                </li>
            </ul>
            </div>
        </div>
        </nav>
    );
}

export default Navbar;