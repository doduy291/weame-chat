import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Forum, Settings, ContactPage, ExitToApp } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { NavWrapper, NavLogo, NavMenu, NavLogout } from './styles';
import { useDispatch } from 'react-redux';
import { getLogout } from '../../redux/actions/auth.action';

const Navigation = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const menuItems = [
    {
      icon: <Forum />,
      title: 'Channel',
      url: '/channel',
    },
    {
      icon: <ContactPage />,
      title: 'Contact',
      url: '/contact',
    },
    {
      icon: <Settings />,
      title: 'Settings',
      url: '/setting',
    },
  ];

  const links = menuItems.map((item, i) => (
    <Link className={`nav__link ${location.pathname.match(item.url) ? 'active' : ''}`} key={i} to={item.url}>
      <Tooltip title={item.title} followCursor>
        <div className="nav__icon">{item.icon}</div>
      </Tooltip>
    </Link>
  ));

  const logoutHandler = (e) => {
    e.preventDefault();
    dispatch(getLogout());
  };

  return (
    <>
      <NavWrapper className="nav">
        <NavLogo className="nav__logo">
          <img src="/assets/images/logo.png" alt="" />
        </NavLogo>
        <NavMenu className="nav__menu">
          <div className="nav__menu-items">{links}</div>
        </NavMenu>
        <NavLogout className="nav__logout">
          <ExitToApp className="logout-icon" onClick={logoutHandler} />
        </NavLogout>
      </NavWrapper>
    </>
  );
};

export default Navigation;
