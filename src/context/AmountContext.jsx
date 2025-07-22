// AmountContext.js
import React, { createContext, useContext, useState } from 'react';

const AmountContext = createContext();

export const AmountProvider = ({ children }) => {
    const [freshCount, setFreshCount] = useState(0);
    const [taggedCount, setTaggedCount] = useState(0);

    return (
        <AmountContext.Provider value={{ freshCount, setFreshCount, taggedCount, setTaggedCount }}>
            {children}
        </AmountContext.Provider>
    );
};

export const useAmount = () => {
    return useContext(AmountContext);
};