import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Routers from './shared/router';
import { UpdateNotification } from './shared/components/UpdateNotification';
function App() {
    const [showUpdateNotification, setShowUpdateNotification] = useState(true);
    return (_jsxs(_Fragment, { children: [_jsx(Routers, {}), showUpdateNotification && (_jsx(UpdateNotification, { onClose: () => setShowUpdateNotification(false) }))] }));
}
export default App;
