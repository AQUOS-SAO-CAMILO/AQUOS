import * as yup from "yup";

export const cadastroSchema = yup.object().shape({
  name: yup.string().required("O campo de nome é obrigatório"),
  email: yup
    .string()
    .email("Email inválido")
    .required("O campo de email é obrigatório"),
  password: yup.string().required("O campo de senha é obrigatório"),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas são diferentes")
    .required("Você deve confirmar a senha"),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("O campo email é obrigatório"),
  password: yup.string().required("O campo de senha é obrigatório")
})

export const preSessaoSchema = yup.object().shape({
  massaCorporal: yup.number().required("O campo de Massa Corporal é obrigatório"),
  duracaoPrevista: yup.number().required("O campo de Duração Prevista é obrigatório"),
  hidratacao: yup.number().required("O campode de Hidratação é obrigatório")
})