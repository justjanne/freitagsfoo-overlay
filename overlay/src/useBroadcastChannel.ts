import {createContext, useContext} from "react";

const BroadcastChannelContext = createContext<BroadcastChannel | null>(null);
export const useBroadcastChannel = () => useContext(BroadcastChannelContext);
export const BroadcastChannelProvider = BroadcastChannelContext.Provider;