import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react";

export default function Login() {
    const { user, loading, login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    useEffect(() => {
        checkLogin();
    }, [user])

    const checkLogin = () => {
        if (user) navigate(redirect);
    };
    // checkLogin();
    const doLogin = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        try {
            await login(form.get('username'), form.get('password'));
        } catch (err){
            console.log(`Failed login`);
            console.log(err);
        }
    };
    return (
        <>
        <div className="flex items-center justify-center min-h-screen">
            <div className="border border-gray-300 rounded p-8 w-80">
                <h3 className="text-center">Login</h3>
                <form onSubmit={ (e) => doLogin(e) } className="flex flex-col gap-2">
                    <input className="p-2 text-lg w-full" type="text" placeholder="Username" name="username" required></input>
                    <input className="p-2 text-lg w-full" type="password" placeholder="Password" name="password" required></input>
                    <input className="p-2 text-lg" type="submit" value="Sign In"></input>
                </form>
            </div>
        </div>
        </>
    )
}