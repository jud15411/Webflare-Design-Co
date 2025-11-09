// src/components/Navbar/Navbar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} container`}>
        <NavLink className={styles.logo} to="/">
          FirmaPlex
        </NavLink>
        <ul className={styles.menu}>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              to="/services"
            >
              Services
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              to="/portfolio"
            >
              Portfolio
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              to="/pricing"
            >
              Pricing
            </NavLink>
          </li>
          <li> 
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              to="/contact"
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};