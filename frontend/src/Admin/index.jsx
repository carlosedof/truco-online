import React, {useContext, useEffect, useState} from "react";
import {WsContext} from "../routes";
import {useNavigate} from "react-router-dom";


const Admin = () => {
    // const toast = useToast();
    const navigate = useNavigate();
    // const client = useContext(WsContext)
    // useEffect(() => {
    //     client.onmessage = ({data}) => {
    //         const response = JSON.parse(data);
    //         if (response.type === 'restart') {
    //             toast({
    //                 title: 'Reiniciado',
    //                 description: "O jogo foi resetado",
    //                 status: 'success',
    //                 duration: 5000,
    //             })
    //         }
    // }}, []);

    return (
        <div className="flex flex-col">
            <h3 className="text-center font-bold text-2xl text-primary mb-12">Opções de mesa</h3>
            <div className="flex flex-col gap-4">
                <button
                    // onClick={() => client.send(JSON.stringify({method: 'restart'}))}
                    className="bg-accent font-semibold rounded py-1 w-44 self-center">
                    Reiniciar jogo
                </button>
                <button
                    // onClick={() => client.send(JSON.stringify({method: 'clearconnections'}))}
                    className="bg-accent font-semibold rounded py-1 w-44 self-center">
                    Limpar conexões
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="border border-neutral-300 font-semibold text-neutral-300 rounded py-1 w-44 self-center mt-8">
                    Voltar à tela inicial
                </button>
            </div>
        </div>
    )
}

export default Admin;
