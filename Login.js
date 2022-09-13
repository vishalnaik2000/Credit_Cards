import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Reset from './Reset'
import { useHistory } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import axios from 'axios';
import { LoginContext } from './LoginContext'
import swal from 'sweetalert';
import emailjs from 'emailjs-com'
import { withCookies, useCookies } from 'react-cookie';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {}
      <Link color="inherit" href="https://www.sc.com/in/">
        © Standard Chartered 2022. All rights reserved.
      </Link>
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',

  },
  image: {
    background: 'url( https://s3.amazonaws.com/prod.lippincott.com/app/uploads/2021/02/01140528/Standard-Chartered_3-scaled.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(1, 10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

  },
  avatar: {
    margin: theme.spacing(0),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    //marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide(props) {
  const classes = useStyles();
  const history = useHistory();

  const { loggedInUser, isLoggedIn, logoutUser, setLoginUserDetails } = useContext(LoginContext);
  // Wherever find bankId -> use props.setBankId
  const [bId, setBId] = useState();
  const [password, setPassword] = useState();  // password state
 
  // const [userEmail, setUserEmail] = useState();
  const [user, setUser] = useState({});
  const [submitted, setSubmitted] = useState("0");
  const [cookies, setCookie] = useCookies(['salesUser']);

  const handleBankIdChange = (e) => {
    setBId(e.target.value);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const handleForgotPassword = (e) => {
    // e.preventDefault();
    // let email = "";
    console.log(bId);
    
    axios.get("http://localhost:8080/cards/entry/getemail?id=" + bId)
      .then(res => {
        let userEmail = res.data;
        
        console.log(userEmail); //working

        let otp = parseInt(Math.random() * 10000);
        if (userEmail === "User does not exist") {
          swal("User does not exist");
        }
        else {
          var otpmail = {
            email: userEmail,
            subject: 'Reset Password',
            //headT: "",
            head: 'Dear Customer, ',
            message: 'The email has otp for the reset password', otp: otp, foot: 'the otp is valid for 5 minutes',
            foot1: 'Happy Banking'
          };
          emailjs.send('service_6u6tr7q', 'otp_mail', otpmail, 'HdN31U8jLXG4Ozq-t')
            .then((res) => {
              console.log(otp);
              console.log(res.text)
            }, (error) => {
              console.log(error.text)
            }
            );
          swal("Enter OTP that was sent to your registered Email Id", {
            content: "input",
            type: "number",
            text: "Enter OTP that was sent to your registered Email Id",
            showCancelButton: true,
            closeOnConfirm: false,
            inputPlaceholder: "OTP",   // .then(value)=>{if($value=otp)
          }).then((value) => {
            console.log(otp);
            console.log(`${value}`);
            if (`${value}` == otp.toString()) {
              setCookie('salesUser', bId, { path: '/' });
              history.push('/reset')
            }
            else {
              swal("Entered OTP is incorrect.");
            }
          }
          );
        }
      }
      )
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://localhost:8080/cards/entry/authenticate", { bankId: bId, password: password })
      .then(response => {
        console.log(response.data);
        if (response.data.jwt == "") {
          swal("You've entered wrong Login Credentials!! ")
        } 
        else {
          props.setJwt(response.data.jwt);
          setLoginUserDetails({ bankId: bId, password: password });
          console.log(bId);
          // console.log(loggedInUser.bankId);

          setCookie('salesUser', bId, { path: '/' });

          history.push('/dashboard');
        }

      })

  }
  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square style={{ backgroundColor: '#f1f1f1' }}>
        <div className={classes.paper}>

          <h2>Sales User Login</h2>
          {/* <br /> */}
          {/* <p> {email}</p> */}
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          {/* <link rel="icon" href="%PUBLIC_URL%/smalllog.ico" /> */}
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} onSubmit={handleSubmit} >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="bankId"
              label="Bank ID"
              name="Bank ID"
              type="number"
              // autoComplete="email"
              autoFocus
              onChange={handleBankIdChange}
              error={bId === "" || submitted === "1"}
              helperText={(bId === "" && submitted !== "1") ? 'Please enter your bankId' : (submitted === "1") ? 'BankId does not exist' : ''}

            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handlePasswordChange}
              error={password === "" || submitted === "2"}
              helperText={(password === "" && submitted !== "2") ? 'Please enter your password' : (submitted === "2") ? 'Password is invalid' : ''}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <br />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Sign In
            </Button>
            <br /> <br />
            <Grid container>
              <Grid item xs>
                <Button onClick={handleForgotPassword} >
                  Forgot password?
                </Button>
              </Grid>

            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
