import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';


const JWT_SECRET = process.env.JWT_SECRET ;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
}
const TOKEN_EXPIRATION: string = process.env.TOKEN_EXPIRATION || '1h'; 

interface UserPayload {
    userId: number;
    username: string;
}

interface RegisterRequest {
    username: string;
    password: string;
    full_name?: string;
}

interface LoginRequest {
    username: string;
    password: string;
}

const generateAccessToken = (payload: UserPayload): string => {
    return jwt.sign(
        payload, 
        JWT_SECRET as string, 
        { expiresIn: TOKEN_EXPIRATION } as jwt.SignOptions
    );
};

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const { username, password, full_name } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, password_hash, full_name)
            VALUES ($1, $2, $3)
            RETURNING id, username, full_name, created_at
        `;
        const newUser = await pool.query(query, [username, hashedPassword, full_name]);

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload: UserPayload = { 
            userId: user.id, 
            username: user.username 
        };
        
        const accessToken = generateAccessToken(payload);

        res.json({
            message: 'Login successful',
            accessToken: accessToken,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};