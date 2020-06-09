import { observable, computed, action } from "mobx";
import axios from 'axios';

export class User {
    @observable id = -1;
    @observable email = '';
    @observable firstName = '';
    @observable lastName = '';

    @computed
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    @action
    clear = () => {
        localStorage.removeItem('token');
        this.id = -1;
        this.firstName = this.lastName = this.email = '';
    }

    @action
    loadUser = async () => {
        let token = localStorage.getItem('token');
        if (!token) {
            this.id = -1;
            this.firstName = this.lastName = this.email = '';
            return;
        }
    
        await axios.post("http://localhost:8080/auth/check_token", {
            token: token
        })
            .then((res) => {
                if (res.data.user) {
                    this.id = res.data.user.id;
                    this.email = res.data.user.email;
                    this.firstName = res.data.user.firstName;
                    this.lastName = res.data.user.lastName;
                } else {
                    this.clear();
                }
            });
    }
};

export const user = new User();