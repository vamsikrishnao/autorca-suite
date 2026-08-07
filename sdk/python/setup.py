from setuptools import setup, find_packages

setup(
    name="autorca-sdk",
    version="1.0.0",
    description="AutoRCA Lightweight Python SDK & Exception Handler Middleware",
    author="AutoRCA Open Source",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    python_requires=">=3.8",
)
