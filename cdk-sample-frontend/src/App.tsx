import React, {useEffect, useState} from 'react';

function App() {
    const [message, setMessage] = useState("")
    useEffect(() => {
        fetch("/api/v1/message")
            .then(a => a.text())
            .then(a => setMessage(a))
    }, [])
    return (
        <div>
            <p>hello</p>
            <p>{message}</p>
        </div>
    );
}

export default App;
