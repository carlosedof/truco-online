import React from 'react';
import useModalStore from "../../store/Modal";
import { AiOutlineExclamationCircle } from "react-icons/all";

const Modal = () => {
  const {visible} = useModalStore();

  if (!visible) return null;

  return (
    <div
      className="flex flex-col justify-center bg-neutral-400 text-white shadow-[5px_3px_8px_rgb(0,0,0)] flex flex-col rounded-lg top-10 fixed w-5/6 sm:w-[320px] h-[220px] p-4 z-40">
      <AiOutlineExclamationCircle className="text-5xl text-red-500 mx-auto mb-2"/>
      <span className="font-bold text-lg mb-6">A equipe adversária pediu truco!</span>
      <span>O que você deseja fazer?</span>
        <div className="flex justify-between mt-4">
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-1">Recusar</button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-1">Aceitar</button>
          <button className="bg-sky-500 hover:bg-neutral-500 text-white font-semibold rounded-lg px-4 py-1">Pedir 6</button>
        </div>
    </div>
  );
};

export default Modal;
