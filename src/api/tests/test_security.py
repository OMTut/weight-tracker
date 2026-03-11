import pytest
from jose import JWTError

from dependencies.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_returns_bcrypt_hash():
    hashed = hash_password("mysecret")
    assert isinstance(hashed, str)
    assert hashed.startswith("$2b$")


def test_verify_password_correct():
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("mysecret")
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token_returns_jwt_string():
    token = create_access_token({"sub": "user-123"})
    assert isinstance(token, str)
    parts = token.split(".")
    assert len(parts) == 3


def test_decode_access_token_returns_payload():
    token = create_access_token({"sub": "user-123"})
    payload = decode_access_token(token)
    assert payload["sub"] == "user-123"


def test_decode_access_token_raises_on_tampered_token():
    token = create_access_token({"sub": "user-123"})
    tampered = token[:-5] + "xxxxx"
    with pytest.raises(JWTError):
        decode_access_token(tampered)
