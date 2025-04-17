import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL


const Login = () => {
    const [admin, SetAdmin] = useState({ Email: "", Password: "" });
    const [msg, setmsg] = useState("")
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleEmailChange = (e) => {
        SetAdmin({ ...admin, Email: e.target.value })

        // Custom email validation
        if (emailRegex.test(inputEmail)) {
            setError('');
        } else if (inputEmail !== '' && !inputEmail.includes('@')) {
            setmsg('Email must contain an "@" symbol.');
        } else {
            setmsg('Please enter a valid email address.');
        }
    };

    const navigate = useNavigate();

    const handlesubmit = async (e) => {
        e.preventDefault()

        if (!emailRegex.test(admin.Email)) {
            setmsg('Please enter a valid email address');
        } else {
            setmsg('');
        }

        try {
            const details = await axios.post(`${VITE_BACKEND_URL}/api/admin`, admin);
            console.log(details.data);

            if (details.status == 200) {
                setmsg(details.data.message)
                navigate('/dashbord')
            }
            else {
                setmsg(details.data.message)
            }
        } catch (err) {
            console.log(err);
            setmsg("Invalid credentials");

        }

    }

    return (
        <>
            <center>
                {msg && <div>{msg}</div>}
                <h1 className='text-3xl font-bold'>LogIn</h1>
                <form className='mt-3 bg-blue-200 rounded-md p-3 w-96 flex flex-col' onSubmit={handlesubmit}>
                    <label>Email : <input type="email" required onChange={handleEmailChange} /></label><br />
                    <label>Password : <input type={showPassword ? "text" : "password"} required onChange={(e) => SetAdmin({ ...admin, Password: e.target.value })} /><FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={togglePasswordVisibility}
                        className='-ml-6 cursor-pointer'
                    /></label><br />
                    <center><button type='submit' className='bg-primary w-32 rounded-lg text-white'>Submit</button></center>
                </form>
            </center>

        </>
    )
}

export default Login
