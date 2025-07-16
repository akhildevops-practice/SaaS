export function getExactPath (path) {
    
    const res = path.split("/");
    let newPath = "";
    
    for (const item of res) {
        if(item !== "uploads") {
            newPath += `/${item}`
        }
    }

    return newPath;
}

export function getExactPathMRM (path) {
    const res = path.split("uploads\\");
    let newPath = "";
    
    for (const item of res) {
        if(item !== "uploads") {
            newPath += `/${item}`
        }
    }
    return newPath;
}