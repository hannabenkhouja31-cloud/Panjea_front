import {createStore} from "solid-js/store";

const [style, setStyle] = createStore({
    isMenuWhite: false,
});

const setIsMenuWhite = (value:boolean) => {
    setStyle("isMenuWhite", value);
}

const updateMenuColorFromPath = (pathname: string) => {
    const whiteMenuPaths = ["/"];
    const isWhite = whiteMenuPaths.includes(pathname);
    setIsMenuWhite(isWhite);
}

export {
    style,
    setIsMenuWhite,
    updateMenuColorFromPath,
}