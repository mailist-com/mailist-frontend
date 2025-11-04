import { Routes } from "@angular/router";
import {Login} from './login/login';
import {Register} from './register/register';
import {ResendCode} from './resend-code/resend-code';
import {TwoStep} from './two-step/two-step';

export const AUTHS_ROUTES: Routes = [
    {
        path: 'auth/login',
        component : Login,
        data: { title: 'Login' },
    },
    {
        path: 'auth/register',
        component : Register,
        data: { title: 'Register' },
    },
    {
        path: 'auth/resend-code',
        component : ResendCode,
        data: { title: 'Resend Code' },
    },
    {
        path: 'auth/two-step',
        component : TwoStep,
        data: { title: 'Two Step' },
    }
]
