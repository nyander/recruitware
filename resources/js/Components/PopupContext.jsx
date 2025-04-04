import { createContext } from "react";

export const PopupContext = createContext({
    setActivePopup: () => {},
    formFields: {},
    formSettings: {},
    handlePopupSubmit: () => {},
    selectedToggleValues: [],
    massCellSelect: false,
});
