import axios from 'axios';
import { BASE_PATH } from '../config.js';

export function getGamesReq(params) {
    return axios.post(`${BASE_PATH}api/get-games`, params);
}

export function startGameReq(params) {
    return axios.post(`${BASE_PATH}api/start-game`, params);
}

export function loginReq(params) {
    return axios.post(`${BASE_PATH}api/login`, params);
}

export function getGameDetailsReq(params) {
    return axios.post(`${BASE_PATH}api/get-game-details`, params);
}

export function endTurnReq(params) {
    return axios.post(`${BASE_PATH}api/end-turn`, params);
}